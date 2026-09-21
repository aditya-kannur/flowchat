# FloatChat

FloatChat is a multimodal semantic query engine and 4D visualization platform for exploring ARGO oceanographic data.

## Overview

ARGO floats continuously collect observations from the world's oceans, producing large volumes of measurements such as:

* Temperature
* Salinity
* Pressure/depth
* Latitude and longitude
* Time
* Float and cycle information

FloatChat provides a simple natural-language interface for exploring this data without requiring users to manually inspect raw scientific datasets.

A user can ask questions such as:

```text
Show float trajectories
```

```text
Show temperature profile
```

```text
Find unusual temperature observations
```

FloatChat interprets the query, selects the appropriate analysis, retrieves the data through a Python backend, and presents the result through interactive visualizations.

## Features

### Semantic Query Engine

Natural-language queries are mapped to supported analytical operations.

Current intents include:

* Float trajectory visualization
* Temperature/depth profile visualization
* Temperature anomaly detection
* Float/observation queries

### Interactive Ocean Visualization

The frontend provides an interactive 3D globe-style visualization showing ARGO observations and trajectories.

Users can:

* Rotate the globe
* Zoom in and out
* Inspect individual observations
* View latitude and longitude
* View temperature
* View pressure/depth
* View float platform number
* View observation time
* Identify detected temperature anomalies

### Temperature Profile

Temperature observations can be displayed against pressure/depth.

The visualization allows users to understand how temperature changes with depth.

### Temperature Anomaly Detection

FloatChat currently detects statistical temperature anomalies using a z-score method.

An observation is flagged when:

```text
|z-score| >= 2
```

The interface displays:

* Number of detected anomalies
* Mean temperature
* Standard deviation
* Individual anomalous observations
* Location and observation information

This implementation is a statistical temperature-anomaly detector. It is not intended to claim formal marine heatwave classification.

## Architecture

```text
                         FloatChat
                            |
                Natural Language Query
                            |
                            v
                    Next.js Frontend
                            |
                            | HTTP / REST
                            v
                     FastAPI Backend
                            |
              +-------------+-------------+
              |             |             |
              v             v             v
        Query Engine   Data Engine   Anomaly Engine
              |             |             |
              +-------------+-------------+
                            |
                            v
                       ARGO Data
                       NetCDF file
```

## Technology Stack

### Frontend

* Next.js
* React
* JavaScript
* React Three Fiber
* Three.js
* Recharts

### Backend

* Python
* FastAPI
* Uvicorn
* Xarray
* Pandas
* NumPy
* h5netcdf
* h5py
* argopy

### Data

The current MVP uses an ARGO NetCDF dataset loaded through Xarray.

The application converts the dataset into a tabular representation for analysis and visualization.

## Project Structure

```text
ARGO/
│
├── backend/
│   ├── main.py
│   ├── data_engine.py
│   ├── query_engine.py
│   ├── anomaly.py
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── app/
│   │   ├── page.js
│   │   ├── layout.js
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── OceanGlobe.js
│   │   └── ProfileChart.js
│   │
│   ├── package.json
│   └── ...
│
├── argo_test.nc
├── .gitignore
└── README.md
```

## Backend API

The FastAPI backend currently exposes endpoints including:

| Endpoint      | Purpose                           |
| ------------- | --------------------------------- |
| `/`           | Backend status                    |
| `/summary`    | Dataset summary                   |
| `/trajectory` | Float trajectory observations     |
| `/profile`    | Temperature/depth profile data    |
| `/anomaly`    | Temperature anomaly detection     |
| `/query`      | Natural-language query processing |

The backend runs locally with:

```bash
uvicorn main:app --reload
```

The API is available at:

```text
http://127.0.0.1:8000
```

FastAPI documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## Frontend

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend is available at:

```text
http://localhost:3000
```

## Example Queries

The semantic query engine currently supports queries such as:

```text
Show float trajectories
```

```text
Show temperature profile
```

```text
Show salinity profile
```

```text
Find unusual temperature observations
```

```text
Detect temperature anomalies
```

The query engine converts these requests into structured intents before the backend performs the corresponding operation.

## Data Processing

The backend loads the NetCDF dataset using Xarray.

The dataset is converted into a Pandas DataFrame containing available fields such as:

```text
LATITUDE
LONGITUDE
TIME
PRES
TEMP
PSAL
PLATFORM_NUMBER
CYCLE_NUMBER
```

The data is then used by the visualization and analysis endpoints.

## Anomaly Method

For temperature anomaly detection, FloatChat calculates:

```text
z = (temperature - mean_temperature) / standard_deviation
```

An observation is classified as a statistical temperature anomaly when:

```text
abs(z) >= 2
```

This provides an interpretable baseline anomaly-detection method for the MVP.

## Deployment

The intended deployment architecture is:

```text
GitHub
   |
   +---- Frontend ----> Vercel
   |
   +---- Backend -----> Render
                          |
                          +---- ARGO NetCDF data
```

The frontend communicates with the deployed FastAPI backend through its public API URL.

For local development:

```text
Next.js
localhost:3000
      |
      v
FastAPI
127.0.0.1:8000
```

For production:

```text
Vercel
   |
   v
Render FastAPI API
   |
   v
ARGO Dataset
```

## Environment

The frontend should use an environment variable for the backend URL rather than hard-coding the local development address.

Example:

```text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

For deployment, this value should be replaced with the public Render backend URL.

## Current MVP Scope

The current version focuses on demonstrating the core concept:

1. Natural-language ocean-data queries
2. Semantic intent detection
3. ARGO data retrieval
4. Interactive trajectory visualization
5. Temperature/depth profiling
6. Statistical temperature anomaly detection
7. Interactive observation inspection

Future versions can extend this into deeper oceanographic analysis, larger ARGO datasets, more sophisticated anomaly definitions, additional variables, and richer geographic visualization.

## Future Improvements

Potential extensions include:

* Larger regional and global ARGO datasets
* Multiple float trajectory separation
* True geographic ocean/land mapping
* More oceanographic variables
* Salinity anomaly detection
* Formal marine heatwave detection using percentile-based climatologies
* Time-series anomaly analysis
* 3D/4D depth and time exploration
* More advanced natural-language query understanding
* LLM-assisted semantic query planning
* Cloud-scale data processing
* User-selected geographic and temporal filters

## Team Project

FloatChat was developed as a hackathon prototype for the ORION 1.0 Hackathon.

The goal is to demonstrate how natural-language interfaces and interactive visualization can make large-scale oceanographic datasets easier to explore and understand.

## License

This project is currently a hackathon prototype. Add an appropriate license before public production use.
