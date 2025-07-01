import Decimal from "decimal.js";


export enum ETipoDeCuotaInicial {
    Porcentual = "PORCENTUAL",
    Valor = "VALOR",
}


export class CuotaInicial {
    public valor: Decimal;
    public tipo: ETipoDeCuotaInicial;

    /**
     * 
     * @param tipo El tipo de cuota inicial, puede ser porcentual o un valor fijo.
     * @param valor El valor de la cuota inicial. Si es porcentual, se ingresa el porcentaje (ej: 20 para 20%), si es un valor fijo, se ingresa el monto (ej: 1000).
     */
    constructor(tipo: ETipoDeCuotaInicial, valor: number | Decimal) {
        this.tipo = tipo;
        if (typeof valor === "number") {
            this.valor = new Decimal(valor);
        } else {
            this.valor = valor;
        }
    }

    calcularCuotaInicial(capital: number | Decimal): Decimal {
        if (this.tipo === ETipoDeCuotaInicial.Porcentual) {
            return this.valor.dividedBy(100).times(capital);
        }
        return this.valor;
    }
}