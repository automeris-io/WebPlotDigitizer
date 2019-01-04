#include <Eigen/Core>
#include <emscripten.h>
#include <iostream>

extern "C" {
    EMSCRIPTEN_KEEPALIVE
    int testfn() {
        Eigen::Matrix4d mat = Eigen::Matrix4d::Identity();
        std::cout << mat << std::endl;
        return 0;
    }
}
