import * as Twig from "twig";
import template from '../templates/card.html.twig';
import {Combination} from "./Combination";
import {NumberFormatter} from "./NumberFormatter";
import {Percentage} from "./Percentage";
import {Simulation} from "./Simulation";

export class View {
    constructor(private resultsElement: HTMLDivElement, private numberFormatter: NumberFormatter) {
        Twig.extendFilter('money', function (amount: any): string {
            if (typeof amount === "number") {
                return this.numberFormatter.formatMoneyFromNumber(amount, 'EUR', 0);
            }

            return this.numberFormatter.formatMoney(amount);
        }.bind(this));

        Twig.extendFilter('percentage', function (percentage: Percentage, args: any[]): string {
            const formatter = new Intl.NumberFormat('nl-NL', {
                style: 'percent',
                maximumFractionDigits: args[0] ?? 2
            });

            return formatter.format(percentage.getFraction());
        }.bind(this));

        Twig.extendFilter('tagDecimals', function (amount: string): string {
            let parts = amount.split(',');

            parts[1] = '<span class="decimals">' + parts[1] + '</span>';

            return parts.join(',');
        }.bind(this));

        Twig.extendFilter('tagAbbreviations', function (name: string): string {
            const abbreviations: {[key: string]: string} = {
                'EM': 'Emerging Markets',
                'ESG': 'Environmental, Social & Governance',
                'ETF': 'Exchange-traded Fund',
                'FGR': 'Fonds voor Gemene Rekening',
                'FTSE': 'Financial Times Stock Exchange',
                'MSCI': 'Morgan Stanley Capital International',
                'IMI': 'Investable Market Index',
                'UCITS': 'Undertakings for Collective Investment in Transferable Securities'
            };

            for (const abbreviation in abbreviations) {
                name = name.replace(abbreviation, `<abbr title="${abbreviations[abbreviation]}">${abbreviation}</abbr>`);
            }

            return name;
        }.bind(this));
    }

    public update(results: { combination: Combination; simulation: Simulation }[]): void {
        this.resultsElement.innerHTML = '';

        const resultsElement = this.resultsElement;

        results.forEach(function (result: { combination: Combination; simulation: Simulation }, index: number): void {
            const element = document.createElement('div');
            element.innerHTML = template({
                index: index,
                broker: result.combination.broker,
                portfolio: result.combination.portfolio,
                combination: result.combination,
                simulation: result.simulation
            });

            resultsElement.appendChild(element);
        }, this);
    }
}
