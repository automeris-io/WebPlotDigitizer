# A simple bar chart

rm(list=ls())

counts <- table(mtcars$carb)

png(filename="barchart.svg", width=300, height=200, units="px", pointsize=14)
#svg(filename="barchart.svg", width=300, height=200, pointsize=14)
par(mar=c(2,2,1,1))
barplot(counts, col=c("darkgreen"))
dev.off()
