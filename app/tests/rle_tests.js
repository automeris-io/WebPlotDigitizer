QUnit.module("RLE tests");

QUnit.test("Encode Array", function(assert) {
    let array = [1, 2, 3, 6, 10, 11, 12, 13, 30, 31];
    let rleArray = wpd.rle.encode(array);
    assert.deepEqual(rleArray, [
        [1, 3],
        [6, 1],
        [10, 4],
        [30, 2]
    ], "encoded array");
});

QUnit.test("Decode RLE Array", function(assert) {
    let rleArray = [
        [1, 3],
        [6, 1],
        [10, 4],
        [30, 2]
    ];
    let array = wpd.rle.decode(rleArray);
    assert.deepEqual(array, [1, 2, 3, 6, 10, 11, 12, 13, 30, 31], "decoded RLE array");
});