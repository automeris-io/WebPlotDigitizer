#!/bin/bash
# Use clang-format to autoformat javascript files

echo "Fomatting..."
find javascript tests -name "*.js" -exec clang-format -i {} \;
echo "Done!"
