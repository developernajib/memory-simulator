// Verbatim Go program rendered in the "task.go" tab.
// Extracted unchanged from the original memory_simulator.html.
/* eslint-disable */
export const GO_SOURCE = `package main

import (
\t"bufio"
\t"encoding/json"
\t"errors"
\t"flag"
\t"fmt"
\t"os"
\t"strconv"
\t"strings"
\t"sync"
\t"time"
)

// Constants demonstration
const (
\tDataFile   = "tasks.json"
\tVersion    = "1.0.0"
\tMaxWorkers = 3
\tTimeFormat = "2006-01-02 15:04:05"
)

// Enums using iota
type Priority int

const (
\tLow Priority = iota
\tMedium
\tHigh
\tCritical
)

func (p Priority) String() string {
\tswitch p {
\tcase Low:
\t\treturn "Low"
\tcase Medium:
\t\treturn "Medium"
\tcase High:
\t\treturn "High"
\tcase Critical:
\t\treturn "Critical"
\tdefault:
\t\treturn "Unknown"
\t}
}

// Struct definition with tags for JSON
type Task struct {
\tID          int        \`json:"id"\`
\tTitle       string     \`json:"title"\`
\tDescription string     \`json:"description"\`
\tPriority    Priority   \`json:"priority"\`
\tCompleted   bool       \`json:"completed"\`
\tCreatedAt   time.Time  \`json:"created_at"\`
\tCompletedAt *time.Time \`json:"completed_at,omitempty"\`
}

// Method on struct
func (t *Task) MarkComplete() {
\tt.Completed = true
\tnow := time.Now()
\tt.CompletedAt = &now
}

// Interface definition
type TaskStorage interface {
\tSave(tasks []Task) error
\tLoad() ([]Task, error)
}

// Struct implementing interface
type FileStorage struct {
\tfilename string
}

func (fs *FileStorage) Save(tasks []Task) error {
\tdata, err := json.MarshalIndent(tasks, "", "  ")
\tif err != nil {
\t\treturn fmt.Errorf("failed to marshal tasks: %w", err)
\t}
\treturn os.WriteFile(fs.filename, data, 0644)
}

func (fs *FileStorage) Load() ([]Task, error) {
\tvar tasks []Task
\tdata, err := os.ReadFile(fs.filename)
\tif err != nil {
\t\tif os.IsNotExist(err) {
\t\t\treturn tasks, nil
\t\t}
\t\treturn nil, fmt.Errorf("failed to read file: %w", err)
\t}
\terr = json.Unmarshal(data, &tasks)
\tif err != nil {
\t\treturn nil, fmt.Errorf("failed to unmarshal tasks: %w", err)
\t}
\treturn tasks, nil
}

// TaskManager struct with embedded storage
type TaskManager struct {
\ttasks   []Task
\tstorage TaskStorage
\tnextID  int
\tmutex   sync.RWMutex
}

func NewTaskManager(storage TaskStorage) *TaskManager {
\ttm := &TaskManager{
\t\tstorage: storage,
\t\tnextID:  1,
\t}
\tif tasks, err := storage.Load(); err == nil {
\t\ttm.tasks = tasks
\t\tfor _, task := range tasks {
\t\t\tif task.ID >= tm.nextID {
\t\t\t\ttm.nextID = task.ID + 1
\t\t\t}
\t\t}
\t}
\treturn tm
}

func (tm *TaskManager) AddTask(title, description string, priority Priority) error {
\tif strings.TrimSpace(title) == "" {
\t\treturn errors.New("task title cannot be empty")
\t}
\ttm.mutex.Lock()
\tdefer tm.mutex.Unlock()
\ttask := Task{
\t\tID:          tm.nextID,
\t\tTitle:       title,
\t\tDescription: description,
\t\tPriority:    priority,
\t\tCompleted:   false,
\t\tCreatedAt:   time.Now(),
\t}
\ttm.tasks = append(tm.tasks, task)
\ttm.nextID++
\treturn tm.storage.Save(tm.tasks)
}

func (tm *TaskManager) GetTasks() []Task {
\ttm.mutex.RLock()
\tdefer tm.mutex.RUnlock()
\ttasksCopy := make([]Task, len(tm.tasks))
\tcopy(tasksCopy, tm.tasks)
\treturn tasksCopy
}

func (tm *TaskManager) CompleteTask(id int) error {
\ttm.mutex.Lock()
\tdefer tm.mutex.Unlock()
\tfor i := range tm.tasks {
\t\tif tm.tasks[i].ID == id {
\t\t\ttm.tasks[i].MarkComplete()
\t\t\treturn tm.storage.Save(tm.tasks)
\t\t}
\t}
\treturn fmt.Errorf("task with ID %d not found", id)
}

func (tm *TaskManager) DeleteTask(id int) error {
\ttm.mutex.Lock()
\tdefer tm.mutex.Unlock()
\tfor i, task := range tm.tasks {
\t\tif task.ID == id {
\t\t\ttm.tasks = append(tm.tasks[:i], tm.tasks[i+1:]...)
\t\t\treturn tm.storage.Save(tm.tasks)
\t\t}
\t}
\treturn fmt.Errorf("task with ID %d not found", id)
}

func (tm *TaskManager) GetTasksByPriority() map[Priority][]Task {
\ttm.mutex.RLock()
\tdefer tm.mutex.RUnlock()
\tpriorityMap := make(map[Priority][]Task)
\tfor _, task := range tm.tasks {
\t\tpriorityMap[task.Priority] = append(priorityMap[task.Priority], task)
\t}
\treturn priorityMap
}

func (tm *TaskManager) ProcessTasksAsync(processor func(Task)) {
\ttasks := tm.GetTasks()
\ttaskChan := make(chan Task, len(tasks))
\tdone := make(chan bool)
\tfor i := 0; i < MaxWorkers; i++ {
\t\tgo func(workerID int) {
\t\t\tfor task := range taskChan {
\t\t\t\tprocessor(task)
\t\t\t}
\t\t\tdone <- true
\t\t}(i)
\t}
\tfor _, task := range tasks {
\t\ttaskChan <- task
\t}
\tclose(taskChan)
\tfor i := 0; i < MaxWorkers; i++ {
\t\t<-done
\t}
}

func main() {
\tvar (
\t\tinteractive = flag.Bool("interactive", false, "Run in interactive mode")
\t\tversion     = flag.Bool("version", false, "Show version")
\t\taddTask     = flag.String("add", "", "Add a task with title")
\t\tlistTasks   = flag.Bool("list", false, "List all tasks")
\t)
\tflag.Parse()
\tif *version {
\t\tfmt.Printf("Task Manager v%s\\n", Version)
\t\treturn
\t}
\tstorage := &FileStorage{filename: DataFile}
\ttm := NewTaskManager(storage)
\tswitch {
\tcase *interactive:
\t\trunInteractiveMode(tm)
\tcase *addTask != "":
\t\ttm.AddTask(*addTask, "Added via command line", Medium)
\tcase *listTasks:
\t\tfor _, task := range tm.GetTasks() {
\t\t\tfmt.Println(task.Title)
\t\t}
\tdefault:
\t\trunInteractiveMode(tm)
\t}
}`;
