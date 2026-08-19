import { LayersControl, TileLayer } from "react-leaflet";
import { tileProviders, DEFAULT_TILE_PROVIDER } from "@repo/maps";

export function TileLayers({ isChangeable }: { isChangeable: boolean }) {
  const defaultProvider = tileProviders[DEFAULT_TILE_PROVIDER];

  return (
    <>
      {isChangeable ? (
        <LayersControl position="topright">
          {/* CartoDB Voyager */}
          <LayersControl.BaseLayer checked name={tileProviders.cartoVoyager.name}>
            <TileLayer
              url={tileProviders.cartoVoyager.url}
              attribution={tileProviders.cartoVoyager.attribution}
            />
          </LayersControl.BaseLayer>
          {/* CartoDB Positron */}
          <LayersControl.BaseLayer name={tileProviders.cartoPositron.name}>
            <TileLayer
              url={tileProviders.cartoPositron.url}
              attribution={tileProviders.cartoPositron.attribution}
            />
          </LayersControl.BaseLayer>
          {/* CartoDB Dark Matter */}
          <LayersControl.BaseLayer name={tileProviders.cartoDark.name}>
            <TileLayer
              url={tileProviders.cartoDark.url}
              attribution={tileProviders.cartoDark.attribution}
            />
          </LayersControl.BaseLayer>
          {/* OpenTopoMap */}
          <LayersControl.BaseLayer name={tileProviders.opentopo.name}>
            <TileLayer
              url={tileProviders.opentopo.url}
              attribution={tileProviders.opentopo.attribution}
            />
          </LayersControl.BaseLayer>
          {/* Esri Satellite */}
          <LayersControl.BaseLayer name={tileProviders.esriSatellite.name}>
            <TileLayer
              url={tileProviders.esriSatellite.url}
              attribution={tileProviders.esriSatellite.attribution}
            />
          </LayersControl.BaseLayer>
          {/* Esri Gray */}
          <LayersControl.BaseLayer name={tileProviders.esriGray.name}>
            <TileLayer
              url={tileProviders.esriGray.url}
              attribution={tileProviders.esriGray.attribution}
            />
          </LayersControl.BaseLayer>
        </LayersControl>
      ) : (
        <TileLayer
          url={defaultProvider.url}
          attribution={defaultProvider.attribution}
        />
      )}
    </>
  );
}