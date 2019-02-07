#pragma once
#include <Eigen/Core>

namespace WPD {
struct Helpers {
    static Eigen::Matrix3d computeHomography(Eigen::Vector2d source[4], Eigen::Vector2d target[4]) {
        // TODO: Assemble Ah = 0, perform SVD and return solution
        return Eigen::Matrix3d::Identity();
    }
};
} // namespace WPD