# QuickFlux

Tool for calculating the magnetic field around high-voltage cables.

## Getting Started

The solution consists of two components: a Python backend API and a TypeScript/React frontend.

### Backend Setup (Python API)

1. Create a virtual environment:
   ```bash
   py -m venv venv
   ```
2. Activate the virtual environment in your terminal:
   ```bash
   .\venv\Scripts\activate
   ```
3. Install the `QuickFlux` python package:

   ```bash
   pip install -e "backend"
   ```

4. Check that the package and dependencies were installed correctly by running the test file:

   ```bash
   pytest .\backend\tests\test_build.py
   ```

5. Start the backend API server:

   ```bash
   cd backend
   python run_api.py
   ```

   The API will start on `http://localhost:5000`

   Interactive API documentation will be available at:
   - Swagger UI: `http://localhost:5000/docs`
   - ReDoc: `http://localhost:5000/redoc`

### Frontend Setup (React)

1. Open a new terminal and navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install the necessary packages. If you don't have [Node.js](https://nodejs.org/en) installed locally on your computer, please install it first before running the command:

   ```bash
   npm install
   ```

3. Run the frontend development server:

   ```bash
   npm run dev
   ```

4. Navigate to the localhost address presented in the terminal (typically `http://localhost:5173`).

## Running the Full Application

To run the full application, you need both the backend API and frontend running simultaneously:

1. **Terminal 1** - Start the Python backend API:

   ```bash
   .\venv\Scripts\activate
   cd backend
   python run_api.py
   ```

2. **Terminal 2** - Start the React frontend:
   ```bash
   cd frontend
   npm run dev
   ```

The frontend will communicate with the backend API to perform magnetic field calculations.
