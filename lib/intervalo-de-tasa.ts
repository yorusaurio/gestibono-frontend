import Decimal from "decimal.js";
import type { Tasa } from "./tasa";


/**
 * Dado que un plan de pago puede tener tasas variables
 * que funcionen por un determinado periodo y luego se cambia por 
 * otra tasa. Es preferible manejar este escenario desde el inicio.
 * 
 * Por defecto todo plan de pago tiene un solo intervalo de tasa
 * a no ser que el usuario especifique otras mas.
 */
export class IntervaloDeTasa {

    public tasa: Tasa;
    public periodoInicio: number;
    public periodoFin: number;

    constructor(tasa: Tasa, periodoInicio: number, periodoFin: number) {
        this.tasa = tasa;
        this.periodoInicio = periodoInicio;
        this.periodoFin = periodoFin;
    }

    /**
     * 
     * @param periodo periodo actual a analizar
     * @returns 
     */
    esAplicable(periodo: Decimal | number): boolean {
        if (typeof periodo === "number") {
            periodo = new Decimal(periodo);
        }
        return periodo.greaterThanOrEqualTo(this.periodoInicio) && periodo.lessThanOrEqualTo(this.periodoFin);
    }

    calcularValorDeTasa(capital: Decimal): Decimal {
        return this.tasa.calcularValorDeTasa(capital);
    }



}