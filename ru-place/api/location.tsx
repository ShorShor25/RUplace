export async function getLocation(): Promise<[latitude: number, longitude: number] | null> {
    if (!("geolocation" in navigator)) {
        return null;
    }
    return new Promise<[latitude: number, longitude: number]>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve([position.coords.latitude, position.coords.longitude]);
            },
            (error) => {
                reject(error);
            }
        );
    }).catch((error) => {
        if (error instanceof GeolocationPositionError) {
            if (error.code === error.PERMISSION_DENIED) {
                console.warn("Geolocation permission denied by the user.");
            } else {
                console.error(`Geolocation error: ${error.message}`);
            }
        } else {
            console.error("An unknown error occurred:", error);
        }
        return null;
    });
}
