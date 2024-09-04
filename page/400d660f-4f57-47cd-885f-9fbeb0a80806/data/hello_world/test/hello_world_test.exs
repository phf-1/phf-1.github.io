defmodule HelloWorldTest do
	# This test must succeed if ran concurrently.
  use ExUnit.Case, async: true

  test "hello" do
		reply = request(hello())
		assert reply.status == 200
    assert reply.body == world()
  end

  test "handler crash" do
		wrong = %{"type" => "Wrong"}
		reply = request(wrong)
		assert reply.status == 500
		%{"type" => "Error", "msg" => _} = reply.body

		# The server should answer.
		reply = request(hello())
		assert reply.status == 200
    assert reply.body == world()
  end

	def url() do
		port = Application.fetch_env!(:hello_world, :port)
		"http://localhost:#{port}"
	end

	def hello() do
		%{"type" => "Hello"}
	end

	def world() do
		%{"type" => "World"}
	end

	def request(msg) do
		{:ok, reply} = Req.post(url(), json: msg)
		reply
	end
end
