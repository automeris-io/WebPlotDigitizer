QUnit.module("SVD tests");
QUnit.test("SVD of 3x3 matrix", function (assert) {
    
    // test matrix
    let mat = [
        [1, 3, 4],
        [6, 9, 8],
        [6, 7, 9]
    ];

    let expectedU = [[-0.25545925, -0.60219924,  0.75637071],
                     [-0.69818735,  0.65607252,  0.28653669],
                     [-0.66878622, -0.45489001, -0.58804768]];

    let expectedD = [19.19848638,  1.66555095,  1.28220936];

    let expectedVtranspose = [[-0.44051914,  0.36318063, -0.82100105],
                              [-0.61106731,  0.54866225,  0.57058434],
                              [-0.65767746, -0.75304022,  0.01976841]];

    let result = wpd.svd(mat);

    assert.equal(wpdtest.matCompare(result.U, expectedU, 1e-5), true, "U");
    assert.equal(wpdtest.vecCompare(result.D, expectedD, 1e-5), true, "D");
    assert.equal(wpdtest.matCompare(result.V, expectedVtranspose, 1e-5), true, "V");
});