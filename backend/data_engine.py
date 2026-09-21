from pathlib import Path
import xarray as xr

DATA_FILE = Path(__file__).resolve().parent.parent / "argo_test.nc"

print(f"[DATA] Loading ARGO dataset from: {DATA_FILE}")

with xr.open_dataset(DATA_FILE, engine="h5netcdf") as _ds:
    DATASET = _ds.load()

print("[DATA] ARGO dataset loaded successfully")
print(f"[DATA] Variables: {list(DATASET.data_vars)}")


def dataset_to_dataframe(ds):
    df = ds.to_dataframe().reset_index()

    columns = [
        "LATITUDE",
        "LONGITUDE",
        "TIME",
        "PRES",
        "TEMP",
        "PSAL",
        "PLATFORM_NUMBER",
        "CYCLE_NUMBER",
    ]

    existing = [c for c in columns if c in df.columns]

    return df[existing].copy()


DATAFRAME = dataset_to_dataframe(DATASET)

print(f"[DATA] DataFrame rows: {len(DATAFRAME)}")


def load_data():
    return DATASET


def get_summary():
    df = DATAFRAME

    return {
        "observations": len(df),
        "floats": int(df["PLATFORM_NUMBER"].nunique()),
        "temperature_min": float(df["TEMP"].min()),
        "temperature_max": float(df["TEMP"].max()),
        "salinity_min": float(df["PSAL"].min()),
        "salinity_max": float(df["PSAL"].max()),
        "latitude_min": float(df["LATITUDE"].min()),
        "latitude_max": float(df["LATITUDE"].max()),
        "longitude_min": float(df["LONGITUDE"].min()),
        "longitude_max": float(df["LONGITUDE"].max()),
    }


def get_trajectory():
    df = DATAFRAME.copy()

    df = df.dropna(subset=["LATITUDE", "LONGITUDE"])
    df = df.sort_values("TIME")

    df["TIME"] = df["TIME"].astype(str)

    result = df[
        ["LATITUDE", "LONGITUDE", "TIME", "PLATFORM_NUMBER"]
    ]

    print(f"[API] trajectory -> {len(result)} points")

    return result.to_dict(orient="records")


def get_profile():
    df = DATAFRAME.copy()

    df = df.dropna(subset=["PRES", "TEMP"])
    df = df.sort_values("PRES")

    result = df[
        ["PRES", "TEMP", "PSAL"]
    ]

    print(f"[API] profile -> {len(result)} points")

    return result.to_dict(orient="records")