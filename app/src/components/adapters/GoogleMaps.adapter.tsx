// 🔑 Adaptateur Google Maps (react-native-maps) — style Niger Royal
import React from 'react';
import RNMapView, {
  Marker as RNMarker,
  Polyline as RNPolyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';

export { PROVIDER_GOOGLE };

export const Marker = (props: any) => <RNMarker {...props} />;

export const Polyline = (props: any) => <RNPolyline {...props} />;

const MapView = (props: any) => (
  <RNMapView
    provider={PROVIDER_GOOGLE}
    style={props.style}
    initialRegion={props.region}
    customMapStyle={props.customMapStyle}
    showsCompass={false}
    showsUserLocation={false}
    toolbarEnabled={false}
    rotateEnabled={false}
    pitchEnabled={false}
    onPress={props.onPress ? (e: any) => props.onPress(e.nativeEvent.coordinate) : undefined}
    onLongPress={props.onPress ? (e: any) => props.onPress(e.nativeEvent.coordinate) : undefined}
  >
    {props.children}
  </RNMapView>
);

export default MapView;
