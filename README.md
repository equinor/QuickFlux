# QuickFlux

Tool for calculating the magnetic field around high-voltage cables.

## Getting Started

The solution consists of two components: a Python backend and a Typescript/React frontend component.
To get started we install the python backend.

1. Create a virtual environment:
   ```bash
   py -m venv venv
   ```
2. Activate the virtual environment in your terminal:
   ```bash
   .\venv\Scripts\activate
   ```
3. Install the `QuickFlux` python package and its dependencies in the virtual environment we just created:
   ```bash
   pip install -e backend
   ```
4. Check that the package and dependencies were installed correctly by running the test file:
   ```bash
   pytest .\backend\tests\test_build.py
   ```

The backend should now be up and running. Next we set up the frontend component.

1. Open a new terminal and navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install the necessary packages. If you don't have [Node.js](https://nodejs.org/en) installed locally on your computer, please install it first before running the command:

   ```bash
   npm install
   ```

3. Run the frontend:

   ```bash
   npm run dev
   ```

4. Navigate to the localhost address presented in the terminal.
