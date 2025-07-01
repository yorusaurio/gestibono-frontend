import Decimal from "decimal.js";
import type { PeriodoDeGracia } from "../periodo-de-gracia";
import { PlanDePago } from "../plan-de-pago";
import type { CuotaInicial } from "../cuota-inicial";
import type { IntervaloDeTasa } from "../intervalo-de-tasa";
import type { EPeriodo } from "../periodo";
import type { IntervaloDeTiempo } from "../intervalo-de-tiempo";
import { Pago } from "../pago";

export class MetodoAleman extends PlanDePago {
    constructor({
        deuda,
        cuotaInicial,
        tasas,
        frecuenciaDePago,
        plazo,
        periodosDeGracia,
    }: {
        deuda: Decimal;
        cuotaInicial: CuotaInicial;
        tasas: IntervaloDeTasa[];
        frecuenciaDePago: EPeriodo;
        plazo: IntervaloDeTiempo;
        periodosDeGracia: PeriodoDeGracia[];
    }) {
        super({
            deuda,
            frecuenciaDePago,
            plazo,
            tasasDeInteres: tasas,
            cuotaInicial,
            periodosDeGracia,
        });
    }

    public override calcularAmortizacion(): Decimal {
        const nroDePeriodosDeGracia = this.periodosDeGracia.length;

        const amortizacion = this.capitalInicial.dividedBy(
            this.periodos.minus(nroDePeriodosDeGracia)
        );
        return amortizacion;
    }

    public override calcularCuota(): Decimal {
        return new Decimal(0);
    }

    public override calcularIntereses(): Decimal {
        const tasaDelPeriodo = this.tasasDeInteres.find((t) =>
            t.esAplicable(this.pagoActual.periodo + 1)
        );
        if (!tasaDelPeriodo) {
            throw new Error(
                "No hay tasa de interes aplicable para el periodo actual"
            );
        }

        const intereses = tasaDelPeriodo.calcularValorDeTasa(
            this.pagoActual.saldoFinal
        );
        return intereses;
    }

    public override calcularSaldoFinal(): Decimal {
        return new Decimal(0);
    }

    public actualizarAmortizacionEntrePagos() {}

    public override calcularPlanDePago() {
        // aplicamos la cuota inicial
        // periodo 0
        this.pagoActual.saldoInicial = this.pagoActual.saldoFinal =
            this.capitalInicial;

        for (let nro = 1; nro < this.periodos.toNumber() + 1; nro++) {
            const amortizacion = this.calcularAmortizacion();
            const intereses = this.calcularIntereses();

            const nuevoPago = new Pago({
                saldoInicial: this.pagoActual.saldoFinal,
                periodo: nro,
                amortizacion,
                intereses,
                cuota: amortizacion.plus(intereses),
                saldoFinal: this.pagoActual.saldoFinal.minus(amortizacion),
            });

            const periodoDeGracia = this.hayUnPeriodoDeGraciaAplicable(nro);
            if (periodoDeGracia) {
                periodoDeGracia.aplicar(nuevoPago);
            }

            // actualizamos el capital incial
            if (nuevoPago.saldoFinal.greaterThan(this.pagoActual.saldoFinal)) {
                this.actualizarCapitalInicial(nuevoPago.saldoFinal);
            }

            nuevoPago.imprimir();

            this.pagoActual.pagoSiguiente = nuevoPago;
            nuevoPago.pagoPrevio = this.pagoActual;
            this.pagoActual = nuevoPago;
        }
    }
}
