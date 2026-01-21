"""
Startup script for QuickFlux API server
"""

import uvicorn

if __name__ == "__main__":
    print("Starting QuickFlux API server on http://localhost:5000")
    print("API endpoints:")
    print("  - GET  /health - Health check")
    print("  - GET  /api/magnetic-field/test - Test endpoint")
    print("  - POST /api/magnetic-field/calculate - Calculate magnetic field")
    print("\nAPI documentation available at:")
    print("  - http://localhost:5000/docs (Swagger UI)")
    print("  - http://localhost:5000/redoc (ReDoc)")
    uvicorn.run("quick_flux.api.app:app", host="0.0.0.0", port=5000, reload=True)
