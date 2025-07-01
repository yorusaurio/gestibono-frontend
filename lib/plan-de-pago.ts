import { Decimal } from "decimal.js";
import { Pago } from "./pago";
import type { PeriodoDeGracia } from "./periodo-de-gracia";
import type { IntervaloDeTasa } from "./intervalo-de-tasa";
import type { EPeriodo } from "./periodo";
import type { CuotaInicial } from "./cuota-inicial";
import type { IntervaloDeTiempo } from "./intervalo-de-tiempo";

export abstract class PlanDePago {
    public deuda: Decimal;
    public tasasDeInteres: IntervaloDeTasa[];
    public periodosDeGracia: PeriodoDeGracia[];
    public frecuenciaDePago: EPeriodo;
    public cuotaInicial: CuotaInicial;
    public plazo: IntervaloDeTiempo;

    public capitalInicial: Decimal;

    public pagoActual: Pago;
    public pagoBase: Pago;

    constructor({
        deuda,
        tasasDeInteres,
        frecuenciaDePago,
        plazo,
        cuotaInicial,
        periodosDeGracia,
    }: {
        deuda: Decimal;
        tasasDeInteres: IntervaloDeTasa[];
        frecuenciaDePago: EPeriodo;
        plazo: IntervaloDeTiempo;
        cuotaInicial: CuotaInicial;
        periodosDeGracia: PeriodoDeGracia[];
    }) {
        this.deuda = deuda;
        this.tasasDeInteres = tasasDeInteres;
        this.periodosDeGracia = periodosDeGracia;
        this.frecuenciaDePago = frecuenciaDePago;
        this.plazo = plazo;
        this.cuotaInicial = cuotaInicial;

        this.transformarTasas();
        const pagoBase = new Pago({
            amortizacion: new Decimal(0),
            intereses: new Decimal(0),
            cuota: new Decimal(0),
            saldoFinal: this.deuda,
            saldoInicial: this.deuda,
            periodo: 0,
        });
        this.pagoActual = pagoBase;
        this.pagoBase = pagoBase;

        this.capitalInicial = this.deuda.minus(
            this.cuotaInicial.calcularCuotaInicial(this.deuda)
        );
    }

    // setup
    public transformarTasas() {
        this.tasasDeInteres.forEach((t) => {
            t.tasa = t.tasa.convertirAEfectiva(this.frecuenciaDePago);
        });
    }

    actualizarCapitalInicial(nuevoCapital: Decimal){
        this.capitalInicial = nuevoCapital;
        return this.capitalInicial;
    }

    get periodos() {
        return this.plazo.convertirA(this.frecuenciaDePago).valor;
    }

    public hayUnPeriodoDeGraciaAplicable(periodo: number): PeriodoDeGracia | undefined {
        return this.periodosDeGracia.find((p) => p.seAplica(new Decimal(periodo)));
    }
    public obtenerPagoSegunPeriodo(periodo: number): Pago {
        let pago : Pago | undefined = undefined;
        let iterador = this.pagoBase;
        for (let i = 0; i < this.periodos.toNumber() + 1; i++) {
            if (iterador.periodo === periodo) {
                pago = iterador;
                break;
            }
            iterador = iterador.pagoSiguiente!;
        }
        if (!pago) {
            throw new Error(`No se encontró un pago para el periodo ${periodo}`);
        }

        return pago;
    }

    public abstract calcularAmortizacion(): Decimal;
    public abstract calcularIntereses(): Decimal;
    public abstract calcularCuota(): Decimal;
    public abstract calcularPlanDePago(): void;

    public abstract calcularSaldoFinal(): Decimal;

}
