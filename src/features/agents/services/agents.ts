@@ -68,7 +68,7 @@
     .from("agent_tasks")
     .select("agent_id, status, count:count(*)")
-    .group("agent_id,status");
+    .group("agent_id", "status");
```