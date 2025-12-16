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
    TodoStatus,
    addTodo,
    deleteTodo,
    getTodos,
    initDB,
    updateTodo,
} from "../services/todoService";

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<TodoStatus>("all");
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

  useEffect(() => {
    reload();
  }, [filter]);

  async function reload() {
    const data = await getTodos(filter);
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
          {item.finished_at && (
            <Text style={styles.finishedAtText}>
              Finished: {new Date(item.finished_at).toLocaleDateString()}
            </Text>
          )}
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

      <View style={styles.filterRow}>
        <FilterButton
          title="All"
          selected={filter === "all"}
          onPress={() => setFilter("all")}
        />
        <FilterButton
          title="Done"
          selected={filter === "done"}
          onPress={() => setFilter("done")}
        />
        <FilterButton
          title="Undone"
          selected={filter === "undone"}
          onPress={() => setFilter("undone")}
        />
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
  finishedAtText: { fontSize: 12, color: "#666" },
  filterRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12 },
  filterButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1, borderColor: "#ccc" },
  filterButtonSelected: { backgroundColor: "#007AFF" },
  filterButtonText: { color: "#007AFF" },
  filterButtonTextSelected: { color: "#fff" },
});

function FilterButton({ title, selected, onPress }: { title: string, selected: boolean, onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, selected && styles.filterButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, selected && styles.filterButtonTextSelected]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
