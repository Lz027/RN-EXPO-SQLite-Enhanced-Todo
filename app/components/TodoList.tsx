import React, { useEffect, useState } from "react";
import {
    Alert,
    Button,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    Todo,
    addTodo,
    deleteTodo,
    getTodos,
    initDB,
    updateTodo,
} from "../services/todoService";

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await initDB();
        await reload();
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  async function reload() {
    const data = await getTodos();
    setTodos(data);
  }

  async function handleAddOrUpdate() {
    if (!text.trim()) return;
    try {
      if (editingId) {
        await updateTodo(editingId, { text: text.trim() });
        setEditingId(null);
      } else {
        await addTodo(text.trim());
      }
      setText("");
      await reload();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleToggle(item: Todo) {
    try {
      await updateTodo(item.id!, { done: item.done ? 0 : 1 });
      await reload();
    } catch (e) {
      console.error(e);
    }
  }

  function startEdit(item: Todo) {
    setEditingId(item.id ?? null);
    setText(item.text);
  }

  function confirmDelete(item: Todo) {
    Alert.alert("Hapus Todo", "Yakin ingin menghapus?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTodo(item.id!);
            await reload();
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  }

  function renderItem({ item }: { item: Todo }) {
    return (
      <View style={styles.itemRow}>
        <TouchableOpacity onPress={() => handleToggle(item)} style={{ flex: 1 }}>
          <Text style={[styles.itemText, item.done ? styles.doneText : null]}>{item.text}</Text>
        </TouchableOpacity>
        <Button title="Edit" onPress={() => startEdit(item)} />
        <View style={{ width: 8 }} />
        <Button color="#d9534f" title="Del" onPress={() => confirmDelete(item)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo (SQLite)</Text>
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Tulis todo..."
          value={text}
          onChangeText={setText}
          style={styles.input}
        />
        <Button title={editingId ? "Simpan" : "Tambah"} onPress={handleAddOrUpdate} />
      </View>

      <FlatList
        data={todos}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        ListEmptyComponent={() => <Text style={{ textAlign: "center" }}>Belum ada todo.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", padding: 8, marginRight: 8, borderRadius: 6 },
  itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  itemText: { fontSize: 16 },
  doneText: { textDecorationLine: "line-through", color: "#999" },
});
