import React, { type PropsWithChildren, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { Checkbox } from "expo-checkbox";
import type { BaseModel } from "pocketbase";

type MultiSelectProps<T extends BaseModel> = {
  options?: T[];
  initiallySelected?: T[];
  placeholder: string;
  onSelectionChange?: (selectedItems: T[]) => void;
};

export function MultiSelect<T extends BaseModel>({
  options = [],
  initiallySelected = [],
  placeholder,
  onSelectionChange,
  children,
}: PropsWithChildren<MultiSelectProps<T>>) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<T[]>(initiallySelected);

  const handleToggle = (option: T) => {
    setSelectedOptions((prev) =>
      prev.find((o) => o.id === option.id)
        ? prev.filter((item) => item.id !== option.id)
        : [...prev, option]
    );
  };

  const handleDone = () => {
    setModalVisible(false);
    onSelectionChange?.(selectedOptions);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText} numberOfLines={1} ellipsizeMode="tail">
          {selectedOptions.length
            ? selectedOptions.map((o) => o.name).join(", ")
            : placeholder}
        </Text>
        <Text style={styles.arrow}>&gt;</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.optionItem}
                  onPress={() => handleToggle(option)}
                >
                  <Checkbox
                    value={selectedOptions.some((o) => o.id === option.id)}
                  />
                  <Text style={styles.optionText}>{option.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {children}
            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  buttonText: {
    flex: 1,
  },
  arrow: {
    transform: [{ rotate: '90deg' }],
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionText: {
    marginLeft: 10,
  },
  doneButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});