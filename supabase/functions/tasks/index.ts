import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface Task {
  id?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const taskId = url.pathname.split('/').pop();

    switch (req.method) {
      case 'GET':
        if (taskId && taskId !== 'tasks') {
          // Get single task with comments
          const { data: task, error: taskError } = await supabase
            .from('tasks')
            .select(`
              *,
              comments (
                id,
                content,
                created_at,
                updated_at
              )
            `)
            .eq('id', taskId)
            .single();

          if (taskError) throw taskError;

          return new Response(JSON.stringify({ data: task }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get all tasks
          const { data: tasks, error } = await supabase
            .from('tasks')
            .select(`
              *,
              comments (
                id,
                content,
                created_at,
                updated_at
              )
            `)
            .order('created_at', { ascending: false });

          if (error) throw error;

          return new Response(JSON.stringify({ data: tasks }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'POST':
        const newTask: Task = await req.json();
        
        // Validate required fields
        if (!newTask.title?.trim()) {
          return new Response(
            JSON.stringify({ error: 'Title is required' }), 
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const { data: createdTask, error: createError } = await supabase
          .from('tasks')
          .insert({
            title: newTask.title.trim(),
            description: newTask.description?.trim() || '',
            status: newTask.status || 'todo'
          })
          .select()
          .single();

        if (createError) throw createError;

        return new Response(JSON.stringify({ data: createdTask }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'PUT':
        if (!taskId || taskId === 'tasks') {
          return new Response(
            JSON.stringify({ error: 'Task ID is required' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const updateTask: Task = await req.json();
        
        if (!updateTask.title?.trim()) {
          return new Response(
            JSON.stringify({ error: 'Title is required' }), 
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const { data: updatedTask, error: updateError } = await supabase
          .from('tasks')
          .update({
            title: updateTask.title.trim(),
            description: updateTask.description?.trim() || '',
            status: updateTask.status || 'todo'
          })
          .eq('id', taskId)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ data: updatedTask }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'DELETE':
        if (!taskId || taskId === 'tasks') {
          return new Response(
            JSON.stringify({ error: 'Task ID is required' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);

        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({ message: 'Task deleted successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});