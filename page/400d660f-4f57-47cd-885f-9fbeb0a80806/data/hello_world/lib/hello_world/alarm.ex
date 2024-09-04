defmodule HelloWorld.Alarm do
  use GenServer
	require Logger

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def init(state) do
    {:ok, state}
  end

  def increment() do
    GenServer.cast(__MODULE__, :increment)
  end

  def decrement() do
    GenServer.cast(__MODULE__, :decrement)
  end

  def count() do
    GenServer.call(__MODULE__, :count)
  end

  def handle_cast(:increment, state) do
    {:noreply, Map.update(state, :count, 1, &(&1 + 1))}
  end

  def handle_cast(:decrement, state) do
		Logger.info("counter decrement")
    {:noreply, Map.update(state, :count, 0, &(&1 - 1))}
  end

  def handle_call(:count, _from, state) do
    {:reply, Map.get(state, :count, 0), state}
  end
end
