import re


def parse_query(text: str):
    original = text
    text = text.lower().strip()

    # Detect anomaly intent
    if any(word in text for word in [
        "anomaly",
        "anomalies",
        "unusual temperature",
        "abnormal temperature",
        "temperature anomaly",
        "heat anomaly",
    ]):
        return {
            "intent": "DETECT_ANOMALY",
            "variable": "TEMP",
            "operation": "z_score",
            "threshold": 2.0,
            "original_query": original,
        }

    # Detect profile intent
    if any(word in text for word in [
        "profile",
        "depth profile",
        "temperature profile",
        "salinity profile",
        "temperature and salinity",
    ]):
        variable = "TEMP"

        if "salinity" in text and "temperature" not in text:
            variable = "PSAL"
        elif "salinity" in text and "temperature" in text:
            variable = "TEMP,PSAL"

        return {
            "intent": "SHOW_PROFILE",
            "variable": variable,
            "operation": "depth_profile",
            "original_query": original,
        }

    # Detect trajectory intent
    if any(word in text for word in [
        "trajectory",
        "track",
        "path",
        "route",
        "movement",
        "where did the float go",
    ]):
        return {
            "intent": "SHOW_TRAJECTORY",
            "variable": None,
            "operation": "trajectory",
            "original_query": original,
        }

    # Detect float intent
    if any(word in text for word in [
        "float",
        "floats",
        "argo",
        "observations",
        "measurements",
        "where are the floats",
    ]):
        return {
            "intent": "SHOW_FLOATS",
            "variable": "TEMP,PSAL",
            "operation": "locations",
            "original_query": original,
        }

    return {
        "intent": "UNKNOWN",
        "variable": None,
        "operation": None,
        "original_query": original,
    }