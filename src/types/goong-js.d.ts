declare module "@goongmaps/goong-js" {
  export interface GoongMapOptions {
    container: string | HTMLElement;
    style: string;
    center?: [number, number];
    zoom?: number;
    pitch?: number;
    bearing?: number;
  }

  export interface MarkerOptions {
    draggable?: boolean;
    color?: string;
  }

  export interface Marker {
    setLngLat(lnglat: [number, number]): Marker;
    addTo(map: any): Marker;
    getLngLat(): { lng: number; lat: number };
    on(event: string, handler: (...args: any[]) => void): void;
  }

  export interface Map {
    on(event: string, handler: (...args: any[]) => void): void;
    getCenter(): { lng: number; lat: number };
  }

  const goong: {
    Map: new (options: GoongMapOptions) => Map;
    Marker: new (options: MarkerOptions) => Marker;
    accessToken: string;
  };

  export default goong;
}
