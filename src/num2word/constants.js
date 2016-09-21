const TEN = 10;
const ONE_HUNDRED = 100;
const ONE_THOUSAND = 1000;
const ONE_MILLION = 1000000;
const ONE_BILLION = 1000000000;           //         1.000.000.000 (9)
const ONE_TRILLION = 1000000000000;       //     1.000.000.000.000 (12)

const LESS_THAN_TWENTY = [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen'
];

const TENTHS_LESS_THAN_HUNDRED = [
    'zero',
    'ten',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety'
];

const ENDS_WITH_DOUBLE_ZERO_PATTERN = /(hundred|thousand|(m|b|tr|quadr)illion)$/;
const ENDS_WITH_TEEN_PATTERN = /teen$/;
const ENDS_WITH_Y_PATTERN = /y$/;
const ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN = /(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)$/;
const ORDINAL_LESS_THAN_THIRTEEN = {
    zero: 'zeroth',
    one: 'first',
    two: 'second',
    three: 'third',
    four: 'fourth',
    five: 'fifth',
    six: 'sixth',
    seven: 'seventh',
    eight: 'eighth',
    nine: 'ninth',
    ten: 'tenth',
    eleven: 'eleventh',
    twelve: 'twelfth'
};

export {
    TEN,
    ONE_HUNDRED,
    ONE_THOUSAND,
    ONE_MILLION,
    ONE_BILLION,
    ONE_TRILLION,
    LESS_THAN_TWENTY,
    TENTHS_LESS_THAN_HUNDRED,
    ORDINAL_LESS_THAN_THIRTEEN,
    ENDS_WITH_DOUBLE_ZERO_PATTERN,
    ENDS_WITH_TEEN_PATTERN,
    ENDS_WITH_Y_PATTERN,
    ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN
}
