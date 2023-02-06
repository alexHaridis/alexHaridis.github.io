Small-Size Dataset: US Population, 1900 vs 2000
Start by choosing a question you’d like your visualization to answer. This question could be the same as in your A1 assignment, or you can explore a new question.
Design a static visualization (i.e., a single image) that you believe effectively tackle that question, and use the question as the title of your graphic. It is recommended that you iterate over your ideas from A1, but you may also draw on inspiration from other sources. 
Provide a short writeup (approximately 2-3 paragraphs) describing your process and design decisions, and in what ways your work in A1 informed your visual design in this assignment. For example, you could discuss to what extend sketching helped inform your design (e.g., did you keep or discard any aspects of your sketches? Or did your work in A1 help you change course for A2?).  




I would like to choose Male population comparison in 1900 and 2000. 

I choose to use the bar chart to represent the question. I also like the little arrow chart which represent the positive or negative growth of population in each age group. But I think I will need to explore more in d3 on how to visualizing that. 

I am going to make a bar chart based on the exact male population vs year.
xAxis would be age group. 
yAxis would be population value.
There are going to be two bar categorys in the chart. 
One for 1900 population value, the one for 2000 population value.

Since this new data set has more precise data. And the sex is reported as 1 and 2. So we need to filter all the "1"s from "Sex", and then filter all the "1900"s in the "1"s and all the "2000"s in the "1". 
The data values are too large to put on the svg canvas, so we have to scale the minimum and maximum value to the scale of the svg size. 