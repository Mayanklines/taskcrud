import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface Comment {
  id?: string;
  task_id: string;
  content: string;
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
    const commentId = url.pathname.split('/').pop();
    const taskId = url.searchParams.get('task_id');

    switch (req.method) {
      case 'GET':
        if (commentId && commentId !== 'comments') {
          // Get single comment
          const { data: comment, error } = await supabase
            .from('comments')
            .select('*')
            .eq('id', commentId)
            .single();

          if (error) throw error;

          return new Response(JSON.stringify({ data: comment }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else if (taskId) {
          // Get comments for a specific task
          const { data: comments, error } = await supabase
            .from('comments')
            .select('*')
            .eq('task_id', taskId)
            .order('created_at', { ascending: true });

          if (error) throw error;

          return new Response(JSON.stringify({ data: comments }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get all comments
          const { data: comments, error } = await supabase
            .from('comments')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          return new Response(JSON.stringify({ data: comments }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'POST':
        const newComment: Comment = await req.json();
        
        // Validate required fields
        if (!newComment.content?.trim()) {
          return new Response(
            JSON.stringify({ error: 'Content is required' }), 
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        if (!newComment.task_id) {
          return new Response(
            JSON.stringify({ error: 'Task ID is required' }), 
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Verify task exists
        const { data: taskExists } = await supabase
          .from('tasks')
          .select('id')
          .eq('id', newComment.task_id)
          .single();

        if (!taskExists) {
          return new Response(
            JSON.stringify({ error: 'Task not found' }), 
            { 
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const { data: createdComment, error: createError } = await supabase
          .from('comments')
          .insert({
            task_id: newComment.task_id,
            content: newComment.content.trim()
          })
          .select()
          .single();

        if (createError) throw createError;

        return new Response(JSON.stringify({ data: createdComment }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'PUT':
        if (!commentId || commentId === 'comments') {
          return new Response(
            JSON.stringify({ error: 'Comment ID is required' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const updateComment: Comment = await req.json();
        
        if (!updateComment.content?.trim()) {
          return new Response(
            JSON.stringify({ error: 'Content is required' }), 
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const { data: updatedComment, error: updateError } = await supabase
          .from('comments')
          .update({
            content: updateComment.content.trim()
          })
          .eq('id', commentId)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ data: updatedComment }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'DELETE':
        if (!commentId || commentId === 'comments') {
          return new Response(
            JSON.stringify({ error: 'Comment ID is required' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const { error: deleteError } = await supabase
          .from('comments')
          .delete()
          .eq('id', commentId);

        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({ message: 'Comment deleted successfully' }), {
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