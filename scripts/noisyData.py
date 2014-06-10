# Script to generate plots with random data points

import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 50, 50)
y = x + np.random.random_sample(50)*10

plt.figure(figsize=(3, 2), dpi=100)
plt.plot(x, y, 'co', linewidth=4.0)
plt.savefig('noisy_data.png')
plt.show()

