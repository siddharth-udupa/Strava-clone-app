import { LayersControl, TileLayer } from "react-leaflet";
import { TileProvider } from "../../../shared/TileProvider";


export function TileLayers({ isChangeable }: { isChangeable: boolean }) {
  return (
    <>
      {isChangeable ?
        <LayersControl position="topright">
          {/* OpenStreetMap (Standard) */}

          {/* CartoDB Voyager */}
          <LayersControl.BaseLayer checked name={TileProvider.cartoVoyager.name}>
            <TileLayer
              url={TileProvider.cartoVoyager.url}
            // attribution={TileProvider.cartoVoyager.attribution}
            />
          </LayersControl.BaseLayer>
          {/* CartoDB Positron */}
          <LayersControl.BaseLayer name={TileProvider.cartoPositron.name}>
            <TileLayer
              url={TileProvider.cartoPositron.url}
            // attribution={TileProvider.cartoPositron.attribution}
            />
          </LayersControl.BaseLayer>
          {/* CartoDB Dark Matter */}
          <LayersControl.BaseLayer name={TileProvider.cartoDark.name}>
            <TileLayer
              url={TileProvider.cartoDark.url}
            // attribution={TileProvider.cartoDark.attribution}
            />
          </LayersControl.BaseLayer>
          {/* CyclOSM */}

          {/* OpenTopoMap */}
          <LayersControl.BaseLayer name={TileProvider.opentopo.name}>
            <TileLayer
              url={TileProvider.opentopo.url}
            // attribution={TileProvider.opentopo.attribution}
            />
          </LayersControl.BaseLayer>
          {/* Esri Satellite */}
          <LayersControl.BaseLayer name={TileProvider.esriSatellite.name}>
            <TileLayer
              url={TileProvider.esriSatellite.url}
            // attribution={TileProvider.esriSatellite.attribution}
            />
          </LayersControl.BaseLayer>
          {/* Esri Gray */}
          <LayersControl.BaseLayer name={TileProvider.esriGray.name}>
            <TileLayer
              url={TileProvider.esriGray.url}
            // attribution={TileProvider.esriGray.attribution}
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        :
        <TileLayer url={TileProvider.openstreetmap.url} />
      }
    </>
  )
}