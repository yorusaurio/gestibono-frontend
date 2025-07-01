import { EPeriodo, Periodo } from "./periodo";
import Decimal from "decimal.js";
import { NRO_DE_DECIMALES } from "./consts";

export enum TipoTasa {
    Nominal,
    Efectiva,
}

export class Tasa {
    private valor: Decimal;
    public tipo: TipoTasa;
    public periodo: Periodo;
    public capitalizacion: Periodo;

    /**
     *
     * @param tipo
     * @param valor El valor que se ingresa esta en formato de porcentaje. Ej 20% = 20; 9.78% = 9.78
     * @param periodo
     * @param capitalizacion
     */
    constructor(
        tipo: TipoTasa,
        valor: number | Decimal,
        periodo: EPeriodo = EPeriodo.Anual,
        capitalizacion: EPeriodo = EPeriodo.Diaria
    ) {
        this.tipo = tipo;
        if (typeof valor === "number") {
            this.valor = new Decimal(valor);
        } else {
            this.valor = valor;
        }
        this.periodo = new Periodo(periodo);
        this.capitalizacion = new Periodo(capitalizacion);
    }

    convertirAEfectiva(
        nuevoPeriodo: EPeriodo,
        nuevaCapitalizacion: EPeriodo = EPeriodo.Diaria
    ): Tasa {
        if (this.tipo === TipoTasa.Nominal) {
            const m = new Decimal(
                Periodo.calcularCapitalizacionesEntrePeriodos(
                    this.periodo.valor,
                    nuevaCapitalizacion
                )
            );
            const n = new Decimal(
                Periodo.calcularCapitalizacionesEntrePeriodos(
                    nuevoPeriodo,
                    nuevaCapitalizacion
                )
            );

            const nuevoValor = new Decimal(1)
                .plus(this.tasa.dividedBy(m))
                .pow(n)
                .minus(1)
                .times(100);

            return new Tasa(
                TipoTasa.Efectiva,
                nuevoValor,
                nuevoPeriodo,
                nuevaCapitalizacion
            );
        } else if (
            this.tipo === TipoTasa.Efectiva &&
            nuevaCapitalizacion === this.capitalizacion.valor
        ) {
            const periodoObjetivo = new Periodo(nuevoPeriodo);

            const nuevoValor = new Decimal(1)
                .plus(this.tasa)
                .pow(
                    new Decimal(periodoObjetivo.dias).dividedBy(
                        this.periodo.dias
                    )
                )
                .minus(1)
                .times(100);

            const nuevaTasa = new Tasa(
                TipoTasa.Efectiva,
                nuevoValor,
                nuevoPeriodo,
                nuevaCapitalizacion
            );

            return nuevaTasa;
        }
        return this;
    }

    convertirANominal(
        nuevoPeriodo: EPeriodo,
        nuevaCapitalizacion: EPeriodo = EPeriodo.Diaria
    ): Tasa {
        if (this.tipo === TipoTasa.Efectiva) {
            const n = new Decimal(
                Periodo.calcularCapitalizacionesEntrePeriodos(
                    this.periodo.valor,
                    nuevaCapitalizacion
                )
            );
            const m = new Decimal(
                Periodo.calcularCapitalizacionesEntrePeriodos(
                    nuevoPeriodo,
                    nuevaCapitalizacion
                )
            );

            const nuevoValor = this.tasa
                .plus(1)
                .pow(new Decimal(1).dividedBy(n))
                .minus(1)
                .times(100)
                .times(m);

            return new Tasa(
                TipoTasa.Nominal,
                nuevoValor,
                nuevoPeriodo,
                nuevaCapitalizacion
            );
        } else if (this.tipo === TipoTasa.Nominal) {
            // Si ya es nominal, como no existe una conversion directa,
            // Lo pasamos a efectiva cambiamos el periodo y capitalizacion
            // y lo pasamos a nominal

            // original se refiere a que es la tasa efectiva de esta instancia
            const tasaEfectivaOriginal = this.convertirAEfectiva(
                this.periodo.valor,
                this.capitalizacion.valor
            );

            const tasaNominalNueva = tasaEfectivaOriginal.convertirANominal(
                nuevoPeriodo,
                nuevaCapitalizacion
            );

            return tasaNominalNueva;
        }
        return this;
    }

    get tasa(): Decimal {
        return this.valor.dividedBy(100);
    }

    get tasaComoNumero(): number {
        return this.valor
            .dividedBy(100)
            .toDecimalPlaces(NRO_DE_DECIMALES)
            .toNumber();
    }

    obtenerTasaFormateada(decimales: number = NRO_DE_DECIMALES) {
        return this.valor.toDecimalPlaces(decimales);
    }

    calcularValorDeTasa(capital: Decimal): Decimal {
        return this.tasa.times(capital);
    }
}
