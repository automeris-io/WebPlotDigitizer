# Python script to generate the default plot

import numpy as np
import matplotlib.pyplot as plt

# Create an array of 100 linearly-spaced points from 0 to 2*pi
x = np.linspace(0,2*np.pi,1000)
y = np.sin(6*x)*np.power(x,1.5)/10.0

x2 = x
y2 = np.power(x, 1.5)/10.0 + 0.1

x3 = x
y3 = -np.power(x, 1.5)/10.0 - 0.1

# Create the plot
plt.plot(x,y,'b')
plt.plot(x2,y2,'g')
plt.plot(x3,y3,'r')
plt.plot(x,-y,'orange')

plt.xlim([0, 2*np.pi])
plt.ylim([-2.0, 2.0])
plt.xlabel('x')
plt.ylabel('y')
#plt.title('WebPlotDigitizer 3.0')

# Save the figure in a separate file
plt.savefig('start.png')

# Draw the plot to the screen
plt.show()
