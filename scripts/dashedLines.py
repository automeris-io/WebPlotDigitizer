# Script to generate plots with dashed lines, dots etc.

import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 10, 1000)
y = np.sin(x)

plt.figure(figsize=(3, 2), dpi=100)
plt.plot(x, y, 'c--', linewidth=4.0)
plt.savefig('dashed_lines.png')
plt.show()


