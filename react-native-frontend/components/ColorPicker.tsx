import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import type { ColorsRecord } from "@/api/pocketbase-types";
import type { Colors } from "@/store/Colors";

type Props = {
  colors: Colors;
  initialSelected?: string;
  onColorSelect: (colorId: string, color: ColorsRecord) => void;
};

export const ColorPicker = ({
  colors,
  initialSelected,
  onColorSelect,
}: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<[string, ColorsRecord] | undefined>(
    initialSelected ? [initialSelected, colors[initialSelected]] : undefined,
  );

  const handleColorSelect = (id: string, color: ColorsRecord) => {
    setSelected([id, color]);
    onColorSelect(id, color);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        {selected ? (
          <View style={styles.selectedColor}>
            <View
              style={[styles.colorPreview, { backgroundColor: selected[1].hex }]}
            />
            <Text>{selected[1].name}</Text>
          </View>
        ) : (
          <Text>Colors</Text>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <FlatList
              data={Object.entries(colors).filter(([_, color]) => color.name && color.hex)}
              numColumns={4}
              keyExtractor={([id]) => id}
              renderItem={({ item: [id, color] }) => (
                <TouchableOpacity
                  style={[
                    styles.colorButton,
                    { backgroundColor: color.hex },
                    selected?.[0] === id && styles.selectedColorButton,
                  ]}
                  onPress={() => handleColorSelect(id, color)}
                />
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  selectedColor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  colorButton: {
    width: 40,
    height: 40,
    margin: 5,
    borderRadius: 20,
  },
  selectedColorButton: {
    borderWidth: 2,
    borderColor: 'black',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});