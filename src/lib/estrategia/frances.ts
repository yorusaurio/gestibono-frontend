import Decimal from "decimal.js";
import { PlanDePago } from "../plan-de-pago";
import type { CuotaInicial } from "../cuota-inicial";
import type { IntervaloDeTasa } from "../intervalo-de-tasa";
import type { EPeriodo } from "../periodo";
import type { IntervaloDeTiempo } from "../intervalo-de-tiempo";
import type { PeriodoDeGracia } from "../periodo-de-gracia";
import {Finance} from "financejs"
import { Pago } from "../pago";

export const finance = new Finance();

export class MetodoFrances extends PlanDePago {
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
        const cuota = this.calcularCuota()
        const intereses = this.calcularIntereses()
        return cuota.minus(intereses)
    }

    public override calcularCuota(): Decimal {
        const tasaDelPeriodo = this.tasasDeInteres.find((t) =>
            t.esAplicable(this.pagoActual.periodo + 1)
        );
        if (!tasaDelPeriodo) {
            throw new Error("No hay tasa de interes aplicable para el periodo actual");
        }

        const tasa = tasaDelPeriodo.tasa.tasa
        const nroPeriodos = this.periodos
        const nroDeGracia = this.periodosDeGracia.length

        if (tasa.equals(0)) {
            return this.capitalInicial.dividedBy(nroPeriodos.minus(nroDeGracia))
        }

        const numerador = this.capitalInicial.times(tasa)
        const denominador = new Decimal(1).minus(
            new Decimal(1).plus(tasa).pow(nroPeriodos.minus(nroDeGracia).negated())
        )

        return numerador.dividedBy(denominador)
    }

    public override calcularSaldoFinal(): Decimal {
        return this.pagoActual.saldoInicial.minus(this.pagoActual.amortizacion)
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

    public override calcularPlanDePago() {
        this.pagoActual.saldoInicial = this.pagoActual.saldoFinal = this.capitalInicial;

        for (let nro = 1; nro < this.periodos.toNumber() + 1; nro++) {
            const cuota = this.calcularCuota()
            const intereses = this.calcularIntereses()
            const amortizacion = cuota.minus(intereses)

            const nuevoPago = new Pago({
                saldoInicial: this.pagoActual.saldoFinal,
                periodo: nro,
                amortizacion,
                intereses,
                cuota,
                saldoFinal: this.pagoActual.saldoFinal.minus(amortizacion),
            });

            const periodoDeGracia = this.hayUnPeriodoDeGraciaAplicable(nro);
            if (periodoDeGracia) {
                periodoDeGracia.aplicar(nuevoPago);
            }

            // actualizamos el capital inicial si hay gracia total
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