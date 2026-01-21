from quick_flux.models.magnetic_field_input import MagneticFieldInput
import numpy as np
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.colors as colors
from math import sqrt
import json
import io
import base64

# This needs to be added to have Matplotlib as a backend process
matplotlib.use("agg")


class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)


def setup_conductor_geometry(input_values):
    """Generate conductor positions and phase angles based on input parameters"""
    positions = []
    phase_angles = []
    total_circuits_width = (input_values.circuits - 1) * input_values.distance_circuit
    x_offset = -total_circuits_width / 2

    # Phase sequence for each circuit type
    sequence_types = {"normal": [0, -120, 120], "reversed": [120, -120, 0]}  # For [L1, L2, L3]  # For [L3, L2, L1]

    for circuit in range(input_values.circuits):
        base_x = x_offset + circuit * input_values.distance_circuit
        # Alternate sequence types per circuit
        if circuit % 2 == 0:
            sequence_type = "normal"
        else:
            sequence_type = "reversed"

        reference_y = -input_values.depth
        if input_values.trefoil:
            # Trefoil arrangement (triangular configuration)
            # Adjusted triangle height calculation, using triangle midpoint as reference * 0.98
            # Consider using adjustment factor

            # L1 at top (triangle height above the reference point)
            # L2 at bottom left (at the reference point)
            # L3 at bottom right (at the reference point)
            triangle_height = input_values.distance_phase * sqrt(3) / 2
            l1 = (base_x, reference_y + triangle_height)
            l2 = (base_x - input_values.distance_phase / 2, reference_y)
            l3 = (base_x + input_values.distance_phase / 2, reference_y)

            phase_angles.append(sequence_types[sequence_type][0])
            phase_angles.append(sequence_types[sequence_type][1])
            phase_angles.append(sequence_types[sequence_type][2])
            if sequence_type == "normal":
                positions.extend([l1, l2, l3])
            else:
                positions.extend([l2, l3, l1])
        else:
            # Flat horizontal arrangement
            for phase in range(3):
                x_pos = base_x + (phase - 1) * input_values.distance_phase
                positions.append((x_pos, reference_y))
                phase_angles.append(sequence_types[sequence_type][phase])
    return positions, phase_angles


def calculate_field_contributions(conductor_positions, input_values, currents):
    """Calculate magnetic field contributions from all conductors"""
    # Calculation Area
    min_x = input_values.xVal * -1
    max_x = input_values.xVal
    min_y = input_values.yMin
    max_y = input_values.yMax

    u_0 = 4e-7 * np.pi
    no_of_steps_x = int(100 * (max_x - min_x))
    no_of_steps_y = int(100 * (max_y - min_y))
    x_coords = np.linspace(min_x, max_x, no_of_steps_x)
    y_coords = np.linspace(min_y, max_y, no_of_steps_y)
    Bx_total = np.zeros((len(x_coords), len(y_coords)), dtype=complex)
    By_total = np.zeros((len(x_coords), len(y_coords)), dtype=complex)

    #  Calculating the magnetic field using Biot-Savart law
    for (x_cond, y_cond), current in zip(conductor_positions, currents):
        current_phasor = current
        # Create a grid of distances from the conductor position.
        X, Y = np.meshgrid(x_coords - x_cond, y_coords - y_cond, indexing="ij")
        # Compute the distance ( R ) from the conductor to each point in the grid.
        R = np.sqrt(X**2 + Y**2)
        with np.errstate(divide="ignore"):
            # Compute the real parts of the magnetic field components using the Biot-Savart law.
            Bx_real = (-Y / R**2) * np.real(current_phasor) * u_0 / (2 * np.pi)
            By_real = (X / R**2) * np.real(current_phasor) * u_0 / (2 * np.pi)
            # Compute the imaginary parts of the magnetic field components.
            Bx_imag = (-Y / R**2) * np.imag(current_phasor) * u_0 / (2 * np.pi)
            By_imag = (X / R**2) * np.imag(current_phasor) * u_0 / (2 * np.pi)
            # Sum the contributions from all conductors.
            Bx_total += Bx_real + 1j * Bx_imag
            By_total += By_real + 1j * By_imag
    # Calculate the total magnetic field magnitude in microtesla (µT).
    B_total = np.sqrt(np.abs(Bx_total) ** 2 + np.abs(By_total) ** 2) * 1e6

    step_length_y = (max_y - min_y) / no_of_steps_y
    # B_0m => Magnetic field values at ground level
    B_0m = B_total[:, int((abs(min_y) + 0) / step_length_y)]
    # B_1m => Magnetic field values at input_values.curve_above (usually 1m above ground level)
    B_1m = B_total[:, int((abs(min_y) + input_values.curve_above) / step_length_y)]

    return x_coords, y_coords, B_total, B_0m, B_1m


def create_plot(x_coords, y_coords, B_field, input_values):
    """Generate magnetic field visualization plot with reference lines"""
    fig, (ax1) = plt.subplots(1, 1, figsize=(10, 8))

    image = ax1.imshow(
        B_field.T,
        origin="lower",
        cmap="Spectral_r",
        norm=colors.LogNorm(vmin=0.1, vmax=1000),
        extent=[x_coords[0], x_coords[-1], y_coords[0], y_coords[-1]],
    )

    cbar = fig.colorbar(image, ax=ax1)
    cbar.set_label("Magnetic Flux Density [μT]")
    ax1.axhline(0, color="blue", linewidth=1, linestyle="--", label="Ground level")
    ax1.axhline(
        input_values.curve_above,
        color="red",
        linewidth=1,
        linestyle="--",
        label=str(input_values.curve_above) + "m height",
    )

    ax1.set_xlabel("Length [m]")
    ax1.set_ylabel("Height [m]")
    ax1.set_title(f"Magnetic Field Distribution\n{input_values.circuits} Circuits @ {input_values.voltage/1e3:.0f} kV")
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format="png", dpi=150)
    plt.close()
    buf.seek(0)

    return buf


def calculate_magnetic_field(input_values: MagneticFieldInput):
    """Main calculation function returning plot PNG bytes"""
    # Calculate conductor currents (3 per circuit)
    currents = []
    conductor_positions, phase_angles = setup_conductor_geometry(input_values)
    for i in range(input_values.circuits):
        for j in range(3):
            if hasattr(input_values, "current") and input_values.current is not None and input_values.current != 0:
                current = complex(
                    input_values.current * np.cos(np.deg2rad(phase_angles[3 * i + j])),
                    input_values.current * np.sin(np.deg2rad(phase_angles[3 * i + j])),
                )
            else:
                current = (
                    complex(np.cos(np.deg2rad(phase_angles[3 * i + j])), np.sin(np.deg2rad(phase_angles[3 * i + j])))
                    * complex(input_values.active_power, -input_values.reactive_power)
                    / (input_values.voltage * sqrt(3))
                )
            print(f"abs current: {abs(current)}, current: {current}")
            currents.append(current)
    try:
        x_coords, y_coords, B_total, B_0m, B_1m = calculate_field_contributions(
            conductor_positions, input_values, currents
        )
    except Exception as e:
        print(f"Error with the calculate field contributions: {e}")
        return {"error": "Error with the field contributions"}
    try:
        image_data = create_plot(x_coords, y_coords, B_total, input_values).getvalue()
        base64_image = base64.b64encode(image_data).decode("ascii")
        response_data = {"image": base64_image, "x_coords": x_coords, "B_0m": B_0m, "B_1m": B_1m}
        json_data = json.dumps(response_data, cls=NumpyEncoder)
        return json_data
    except Exception as e:
        print("Error with the calculation")
        print(e)
        return {"error": "Error with the calculation"}
