from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from quick_flux.models.magnetic_field_input import MagneticFieldInput
from quick_flux.single_core_cables_in_ground import calculate_magnetic_field
import json

app = FastAPI(title="QuickFlux API", version="1.0.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/api/magnetic-field/calculate")
def calculate(input_data: MagneticFieldInput):
    """
    Calculate magnetic field distribution based on input parameters

    Expected JSON body should match MagneticFieldInputDto from frontend
    """
    try:
        input_data.active_power = input_data.active_power * 1e6  # Convert from MW to W
        input_data.reactive_power = input_data.reactive_power * 1e6  # Convert from MVar to Var
        input_data.voltage = input_data.voltage * 1e3  # Convert from kV to V

        result_json = calculate_magnetic_field(input_data)
        return Response(content=result_json, media_type="application/json")

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input data: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation failed: {str(e)}")


@app.get("/api/magnetic-field/test")
def test_endpoint():
    """Test endpoint to verify API is working"""
    return {"message": "QuickFlux API is running", "version": "1.0.0"}
