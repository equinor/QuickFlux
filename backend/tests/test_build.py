import json
from quick_flux.single_core_cables_in_ground import calculate_magnetic_field
from quick_flux.models.magnetic_field_input import MagneticFieldInput


def test_build():
    assert True


def test_calculate_magnetic_field():
    input_values = MagneticFieldInput(
        circuits=2,
        voltage=220000,
        active_power=413440000,
        current=1085,
        reactive_power=1 * 1e6,
        distance_circuit=1,
        distance_phase=0.25,
        depth=1.2,
        xVal=15,
        yMin=-5,
        yMax=5,
        curve_above=1.0,
        cable_diameter=0.2,
    )

    result = calculate_magnetic_field(input_values)
    result_data = json.loads(result)
    B_1m_max = max(result_data["B_1m"])

    assert 15 <= B_1m_max <= 16, f"B_1m max is {B_1m_max}, expected between 15 and 16"


def test_calculate_magnetic_field_with_different_depth():
    input_values = MagneticFieldInput(
        circuits=2,
        voltage=220000,
        active_power=413440000,
        current=1085,
        reactive_power=1 * 1e6,
        distance_circuit=1,
        distance_phase=0.25,
        depth=1.5,
        xVal=15,
        yMin=-5,
        yMax=5,
        curve_above=1.0,
        cable_diameter=0.2,
    )

    result = calculate_magnetic_field(input_values)
    result_data = json.loads(result)

    B_1m_max = max(result_data["B_1m"])

    assert 10 <= B_1m_max <= 12, f"B_1m max is {B_1m_max}, expected between 10 and 12"
