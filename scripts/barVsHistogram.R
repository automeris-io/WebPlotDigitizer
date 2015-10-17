# Bar chart vs. Histogram

rm(list=ls())

# make a simple histogram
png(filename="histogram.png", width=350, height=350, units="px", pointsize=14)
hist(mtcars$mpg, col='darkred', xlab='Miles per gallon', main='Histogram of vehicle MPGs')
dev.off()

# simple bar graph
counts <- table(mtcars$gear)
png(filename="barchart.png", width=350, height=350, units="px", pointsize=14)
barplot(counts, main='Gears in various vehicles', names.arg=c("3 Gears", "4 Gears", "5 Gears"), col='blue')
dev.off()