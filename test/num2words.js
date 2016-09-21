import { default as toWords, toWordsOrdinal } from '../src/num2word';
import { expect } from "chai";

describe("test number to words", function() {
    it("can transform small ints", function() {
        expect(toWords(0)).to.equal("zero");
        expect(toWords(1)).to.equal("one");
        expect(toWords(2)).to.equal("two");
        expect(toWords(3)).to.equal("three");
        expect(toWords(4)).to.equal("four");
        expect(toWords(5)).to.equal("five");
        expect(toWords(6)).to.equal("six");
        expect(toWords(7)).to.equal("seven");
        expect(toWords(8)).to.equal("eight");
        expect(toWords(9)).to.equal("nine");
        expect(toWords(10)).to.equal("ten");
    });

    it("can transform number in the tens", function() {
        expect(toWords(21)).to.equal("twenty-one");
    });

    it("can transform number in the hundreds", function() {
        expect(toWords(345)).to.equal("three hundred forty-five");
    });

    it("can transform into ordinal word version", function() {
        expect(toWordsOrdinal(352)).to.equal("three hundred fifty-second");
    });
});
