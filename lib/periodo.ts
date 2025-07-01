import Decimal from "decimal.js";

export enum EPeriodo {
    Diaria = "DIARIA",
    Semanal = "SEMANAL",
    Quincenal = "QUINCENAL",
    Mensual = "MENSUAL",
    Bimestral = "BIMESTRAL",
    Trimestral = "TRIMESTRAL",
    Cuatrimestral = "CUATRIMESTRAL",
    Semestral = "SEMESTRAL",
    Anual = "ANUAL",
}

export function obtenerDiasSegunUnidad(unidad: EPeriodo): Decimal {
    switch (unidad) {
        case EPeriodo.Diaria:
            return new Decimal(1);
        case EPeriodo.Semanal:
            return new Decimal(7);
        case EPeriodo.Quincenal:
            return new Decimal(15);
        case EPeriodo.Mensual:
            return new Decimal(30);
        case EPeriodo.Bimestral:
            return new Decimal(60);
        case EPeriodo.Trimestral:
            return new Decimal(90);
        case EPeriodo.Cuatrimestral:
            return new Decimal(120);
        case EPeriodo.Semestral:
            return new Decimal(180);
        case EPeriodo.Anual:
            return new Decimal(360);
        default:
            console.error(
                "Periodo no válido para el cálculo de días. Intentando usar",
                unidad
            );

            return new Decimal(0);
    }
}

export class Periodo {
    public valor: EPeriodo;

    constructor(valor: EPeriodo) {
        this.valor = valor;
    }

    get dias() {
        return obtenerDiasSegunUnidad(this.valor);
    }

    private calcularNroDeCapitalizacionesContraOtro(otro: EPeriodo): Decimal {
        const otroPeriodo = new Periodo(otro);

        if (this.valor === otroPeriodo.valor) {
            return new Decimal(1);
        }

        const diasEste = this.dias;
        const diasOtro = otroPeriodo.dias;

        if (diasEste.equals(0) || diasOtro.equals(0)) {
            throw new Error(
                "Periodo no válido para el cálculo de capitalizaciones."
            );
        }

        return diasEste.dividedBy(diasOtro).toDecimalPlaces(2);
    }

    static calcularCapitalizacionesEntrePeriodos(
        a: EPeriodo,
        b: EPeriodo
    ): Decimal {
        const periodoA = new Periodo(a);
        return periodoA.calcularNroDeCapitalizacionesContraOtro(b);
    }
}
