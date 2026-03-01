import React, { useEffect, useRef, useState } from 'react';

export interface RspressMapProps {
    type?: 'hybrid' | 'google' | 'gaode' | 'baidu' | 'geoq' | 'openstreet' | string;
    lat?: string | number;
    lng?: string | number;
    zoom?: string | number;
    width?: string;
    height?: string;
    marker?: boolean | string;
    markerText?: string;
    layerType?: number | string;
}

declare global {
    interface Window {
        L: any;
    }
}

const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (typeof window !== 'undefined' && document.querySelector(`script[src="${src}"]`)) {
            // Already added, wait for it to load if it hasn't mapped to window yet
            let attempts = 0;
            const check = () => {
                if (window.L && src.includes('leaflet@')) return resolve();
                if (window.L && window.L.tileLayer && window.L.tileLayer.chinaProvider && src.includes('ChineseTmsProviders')) return resolve();

                attempts++;
                if (attempts > 50) return reject(new Error(`Timeout loading ${src}`)); // 5 seconds
                setTimeout(check, 100);
            };
            check();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
    });
};

const loadCss = (href: string) => {
    if (typeof window !== 'undefined' && document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
};

export const RspressMap: React.FC<RspressMapProps> = (props) => {
    const {
        type = 'gaode',
        lat = 39.9042,
        lng = 116.4074,
        zoom = 16,
        width = '100%',
        height = '400px',
        marker = true,
        markerText = '',
        layerType
    } = props;

    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const id = useRef(`map-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const initLeaflet = async () => {
            try {
                loadCss('//unpkg.com/hexo-tag-map/lib/leaflet@1.7.1.css');
                await loadScript('//unpkg.com/hexo-tag-map/lib/leaflet@1.7.1.js');
                await loadScript('//unpkg.com/hexo-tag-map/lib/leaflet.ChineseTmsProviders@1.0.4.js');
                setIsLoaded(true);
            } catch (error) {
                console.error('Failed to load map scripts:', error);
            }
        };

        if (window.L && window.L.tileLayer && window.L.tileLayer.chinaProvider) {
            setIsLoaded(true);
        } else {
            initLeaflet();
        }
    }, []);

    useEffect(() => {
        if (!isLoaded || !mapRef.current) return;

        const latNum = Number(lat);
        const lngNum = Number(lng);
        const zoomNum = Number(zoom);
        const showMarker = marker === true || marker === 'true';

        const L = window.L;

        // Cleanup previous map instance if it exists
        if (leafletMapRef.current) {
            leafletMapRef.current.remove();
            leafletMapRef.current = null;
        }

        // Setup providers based on hexo-tag-map config
        const normalm = L.tileLayer.chinaProvider('GaoDe.Normal.Map', { maxZoom: 20, minZoom: 1, attribution: '高德地图' });
        const imgm = L.tileLayer.chinaProvider('GaoDe.Satellite.Map', { maxZoom: 20, minZoom: 1, attribution: '高德地图' });
        const imga = L.tileLayer.chinaProvider('GaoDe.Satellite.Annotion', { maxZoom: 20, minZoom: 1, attribution: '高德地图' });

        const googleNormal = L.tileLayer.chinaProvider('Google.Normal.Map', { maxZoom: 21, minZoom: 1, attribution: 'Google Maps' });
        const googleSatellite = L.tileLayer.chinaProvider('Google.Satellite.Map', { maxZoom: 21, minZoom: 1, attribution: 'Google Maps' });
        const googleRoute = L.tileLayer.chinaProvider('Google.Satellite.Annotion', { maxZoom: 21, minZoom: 1, attribution: 'Google Maps' });

        const geoqNormal = L.tileLayer.chinaProvider('Geoq.Normal.Map', { maxZoom: 21, minZoom: 1, attribution: 'GeoQ' });

        const normalGaode = L.layerGroup([normalm]);
        const imageGaode = L.layerGroup([imgm, imga]);

        // Define base layers control
        const baseLayers = {
            "高德地图": normalGaode,
            "智图地图": geoqNormal,
            "谷歌地图": googleNormal,
            "高德卫星地图": imgm,
            "谷歌卫星地图": googleSatellite,
            "高德卫星标注": imageGaode,
            "谷歌卫星标注": googleRoute
        };

        let defaultLayer = normalGaode;

        // Follow hexo-tag-map layer logic if layerType (tuceng) is specifically provided
        if (layerType !== undefined) {
            const layerNum = Number(layerType);
            if (layerNum === 2) defaultLayer = geoqNormal;
            else if (layerNum === 3) defaultLayer = googleNormal;
            else if (layerNum === 4) defaultLayer = imgm;
            else if (layerNum === 5) defaultLayer = googleSatellite;
            else if (layerNum === 6) defaultLayer = imageGaode;
            else if (layerNum === 7) defaultLayer = googleRoute;
        } else {
            // Select the default layer based on type if no layerType is provided
            if (type === 'google') defaultLayer = googleNormal;
            else if (type === 'hybrid') defaultLayer = imageGaode;
            else if (type === 'geoq') defaultLayer = geoqNormal;
            else if (type === 'baidu') defaultLayer = geoqNormal; // Fallback since Baidu uses different coords traditionally, mapping it to GeoQ or Gaode is safer for standard WGS84 coords
        }

        const map = L.map(mapRef.current, {
            center: [latNum, lngNum],
            zoom: zoomNum,
            layers: [defaultLayer],
            zoomControl: false // hexo-tag-map disables default to add custom one
        });

        L.control.layers(baseLayers, null).addTo(map);
        L.control.zoom({ zoomInTitle: '放大', zoomOutTitle: '缩小' }).addTo(map);

        if (showMarker) {
            const m = L.marker([latNum, lngNum]).addTo(map);
            if (markerText) {
                m.bindPopup(markerText).openPopup();
            }
        }

        leafletMapRef.current = map;

        return () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
            }
        };
    }, [isLoaded, lat, lng, zoom, type, marker, markerText, layerType]);

    const heightValue = height || '400px';
    const widthValue = width || '100%';

    return (
        <div className="map-box" style={{ margin: '0.8rem 0 1.6rem 0' }}>
            <div
                id={id.current}
                ref={mapRef}
                style={{
                    maxWidth: widthValue,
                    height: heightValue,
                    display: 'block',
                    margin: '0 auto',
                    zIndex: 1,
                    borderRadius: '5px'
                }}
            />
        </div>
    );
};

export default RspressMap;
