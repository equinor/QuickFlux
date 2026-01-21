export interface MagneticFieldResponse {
    image: string;
    x_coords: number[];
    B_0m: number[];
    B_1m: number[];
}

export const defaultMagneticFieldResponse: MagneticFieldResponse = {
    image: "",
    x_coords: [],
    B_0m: [],
    B_1m: [],
};
