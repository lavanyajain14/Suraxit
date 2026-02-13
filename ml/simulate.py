import numpy as np
import tensorflow as tf

interpreter = tf.lite.Interpreter(model_path="model.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

sample = np.random.rand(1, input_details[0]['shape'][1]).astype(np.float32)

interpreter.set_tensor(input_details[0]['index'], sample)
interpreter.invoke()

output = interpreter.get_tensor(output_details[0]['index'])
print("Fall Probability:", output)
