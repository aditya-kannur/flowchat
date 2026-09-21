from fastapi import FastAPI

from data_engine import (
    get_summary,
    get_trajectory,
    get_profile,
    load_data,
    dataset_to_dataframe,
)

from anomaly import detect_temperature_anomalies
from query_engine import parse_query
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI(
    title="FloatChat API",
    description="ARGO oceanographic semantic query engine",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": "FloatChat",
        "status": "online",
        "message": "ARGO oceanographic query engine"
    }


@app.get("/summary")
def summary():
    return get_summary()


@app.get("/trajectory")
def trajectory():
    data = get_trajectory()

    return {
        "count": len(data),
        "data": data,
    }


@app.get("/profile")
def profile():
    data = get_profile()

    return {
        "count": len(data),
        "data": data,
    }


@app.get("/anomaly")
def anomaly():
    ds = load_data()
    df = dataset_to_dataframe(ds)

    result, mean_temp, std_temp = detect_temperature_anomalies(df)

    anomalies = result[result["anomaly"]].copy()

    anomalies["TIME"] = anomalies["TIME"].astype(str)

    columns = [
        "LATITUDE",
        "LONGITUDE",
        "TIME",
        "PRES",
        "TEMP",
        "PSAL",
        "PLATFORM_NUMBER",
        "z_score",
    ]

    anomalies = anomalies[columns]

    return {
        "method": "temperature z-score",
        "threshold": 2.0,
        "mean_temperature": float(mean_temp),
        "standard_deviation": float(std_temp),
        "anomaly_count": len(anomalies),
        "data": anomalies.to_dict(orient="records"),
    }


@app.get("/query")
def natural_language_query(q: str):
    parsed = parse_query(q)

    if parsed["intent"] == "SHOW_FLOATS":
        data = get_trajectory()

        return {
            "query": q,
            "parsed_query": parsed,
            "count": len(data),
            "data": data,
        }

    if parsed["intent"] == "SHOW_TRAJECTORY":
        data = get_trajectory()

        return {
            "query": q,
            "parsed_query": parsed,
            "count": len(data),
            "data": data,
        }

    if parsed["intent"] == "SHOW_PROFILE":
        data = get_profile()

        return {
            "query": q,
            "parsed_query": parsed,
            "count": len(data),
            "data": data,
        }

    if parsed["intent"] == "DETECT_ANOMALY":
        ds = load_data()
        df = dataset_to_dataframe(ds)

        result, mean_temp, std_temp = detect_temperature_anomalies(df)

        anomalies = result[result["anomaly"]].copy()

        anomalies["TIME"] = anomalies["TIME"].astype(str)

        columns = [
            "LATITUDE",
            "LONGITUDE",
            "TIME",
            "PRES",
            "TEMP",
            "PSAL",
            "PLATFORM_NUMBER",
            "z_score",
        ]

        anomalies = anomalies[columns]

        return {
            "query": q,
            "parsed_query": parsed,
            "method": "temperature z-score",
            "mean_temperature": float(mean_temp),
            "standard_deviation": float(std_temp),
            "anomaly_count": len(anomalies),
            "data": anomalies.to_dict(orient="records"),
        }

    return {
        "query": q,
        "parsed_query": parsed,
        "message": (
            "I could not determine the requested oceanographic operation."
        ),
        "supported_queries": [
            "Show me the float trajectories",
            "Show the temperature profile",
            "Show temperature and salinity profile",
            "Find unusual temperature observations",
        ],
    }