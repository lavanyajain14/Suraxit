import tensorflow as tf
from preprocess import X_combined, y_combined
from sklearn.model_selection import train_test_split

X_train, X_val, y_train, y_val = train_test_split(
    X_combined, y_combined, test_size=0.2
)

model = tf.keras.Sequential([
    tf.keras.layers.Dense(32, activation='relu', input_shape=(X_train.shape[1],)),
    tf.keras.layers.Dense(16, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])

model.compile(
    optimizer='adam',
    loss='binary_crossentropy',
    metrics=['accuracy']
)

model.fit(X_train, y_train, epochs=20, validation_data=(X_val, y_val))

model.save("model.h5")
