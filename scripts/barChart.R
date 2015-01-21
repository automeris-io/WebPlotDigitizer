# A simple bar chart

rm(list=ls())

counts <- table(mtcars$carb)

png(filename="barchart.png", width=300, height=200, units="px", pointsize=14)
par(mar=c(2,2,1,1))
barplot(counts, col=c("darkgreen"))
dev.off()


png(filename="barchart2.png", width=300, height=200, units="px", pointsize=14)
par(mar=c(2,2,1,1))
barplot(counts, col=c("darkblue"), horiz=TRUE)
dev.off()
