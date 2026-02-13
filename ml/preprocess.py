import numpy as np

# Load training data
X_train = np.loadtxt("UCI HAR Dataset/train/X_train.txt")
y_train = np.loadtxt("UCI HAR Dataset/train/y_train.txt")

X_test = np.loadtxt("UCI HAR Dataset/test/X_test.txt")
y_test = np.loadtxt("UCI HAR Dataset/test/y_test.txt")

# Convert ALL activities to Normal (0)
y_train_binary = np.zeros(len(y_train))
y_test_binary = np.zeros(len(y_test))

print("Training samples:", X_train.shape)
print("Binary labels shape:", y_train_binary.shape)

# Create synthetic fall samples
num_fall_samples = 500

# Random spike pattern
fall_data = np.random.normal(0, 0.5, (num_fall_samples, X_train.shape[1]))

# Add high acceleration spike
fall_data[:, :10] += np.random.normal(5, 1, (num_fall_samples, 10))

fall_labels = np.ones(num_fall_samples)

# Combine with normal data
X_combined = np.vstack((X_train, fall_data))
y_combined = np.concatenate((y_train_binary, fall_labels))

print("Final dataset shape:", X_combined.shape)
print("Fall samples:", np.sum(y_combined))
