import Decimal from "decimal.js";
import type { EPeriodo } from "./periodo";
import { obtenerDiasSegunUnidad } from "./periodo";

export class IntervaloDeTiempo {
    public valor: Decimal;
    public unidad: EPeriodo;

    constructor(valor: Decimal | number, unidad: EPeriodo) {
        this.unidad = unidad;
        if (typeof valor === "number") {
            this.valor = new Decimal(valor);
        } else {
            this.valor = valor;
        }
    }

    convertirA(nuevaUnidad: EPeriodo): IntervaloDeTiempo {
        const diasDeLaUnidad = obtenerDiasSegunUnidad(this.unidad)

        const cantidadDeDiasActual = this.valor.times(diasDeLaUnidad);

        const diasDeLaNuevaUnidad = obtenerDiasSegunUnidad(nuevaUnidad);

        const cantidadDeDiasNueva = cantidadDeDiasActual.dividedBy(diasDeLaNuevaUnidad);

        return new IntervaloDeTiempo(cantidadDeDiasNueva, nuevaUnidad);
    }
}
