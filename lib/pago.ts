import type Decimal from "decimal.js";

export class Pago {
    public saldoInicial: Decimal;
    public intereses: Decimal;
    public amortizacion: Decimal;
    public cuota: Decimal;
    public saldoFinal: Decimal;
    public periodo: number;

    public pagoSiguiente: Pago | null = null;
    public pagoPrevio: Pago | null = null;

    constructor({
        saldoInicial,
        intereses,
        amortizacion,
        cuota,
        saldoFinal,
        periodo,
    }: {
        saldoInicial: Decimal;
        intereses: Decimal;
        amortizacion: Decimal;
        cuota: Decimal;
        saldoFinal: Decimal;
        periodo: number;
    }) {
        this.saldoInicial = saldoInicial;
        this.intereses = intereses;
        this.amortizacion = amortizacion;
        this.cuota = cuota;
        this.saldoFinal = saldoFinal;
        this.periodo = periodo;
    }

    imprimir() {
        console.log(`
periodo: ${this.periodo} saldo inicial: ${this.saldoInicial.toDecimalPlaces(2)} intereses: ${this.intereses.toDecimalPlaces(2)} amortizacion: ${this.amortizacion.toDecimalPlaces(2)} cuota: ${this.cuota.toDecimalPlaces(2)} saldo final: ${this.saldoFinal.toDecimalPlaces(2)}`);
    }
}
