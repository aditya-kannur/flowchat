import argopy

print("ARGOPY:", argopy.__version__)
print("Starting ARGO request...")

fetcher = (
    argopy.DataFetcher(
        src="erddap",
        ds="phy",
        mode="standard"
    )
    .region([
        -75, -45,      # longitude
        20, 30,        # latitude
        0, 10,         # depth
        "2011-01",
        "2011-06"
    ])
)

print(fetcher)

print("\nDownloading...")

ds = fetcher.load().data

print("\n========== SUCCESS ==========")

print(ds)

print("\n========== VARIABLES ==========")
print(list(ds.data_vars))

print("\n========== COORDINATES ==========")
print(list(ds.coords))

print("\n========== NUMBER OF OBSERVATIONS ==========")
print(ds.sizes)


ds.to_netcdf("argo_test.nc")

print("\nSaved: argo_test.nc")