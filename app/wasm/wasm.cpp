#include <iostream>
#include <Eigen/Core>

int main() {
    Eigen::Matrix4d mat = Eigen::Matrix4d::Identity();
    std::cout << mat << std::endl;
}
